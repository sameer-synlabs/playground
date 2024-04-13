import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Slider,
  Button,
  Upload,
  message,
  Image,
  Tag,
} from "antd";
import { UploadOutlined, EyeOutlined } from "@ant-design/icons";
import { useForm, useWatch } from "antd/es/form/Form";
import { IMAGE_GENERATION } from "./api/apiService";

const { Item } = Form;

const App = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form] = useForm();

  const propmtStrength = useWatch("prompt_strength", form);
  const guidanceScale = useWatch("guidance_scale", form);
  const numInferenceSteps = useWatch("num_inference_steps", form);

  useEffect(() => {
    form.setFieldsValue({
      prompt_strength: 0.7,
      guidance_scale: 15,
      num_inference_steps: 50,
    });
  }, []);

  const onPreview = async (file) => {
    let src = file.url;

    if (!src && file.originFileObj instanceof Blob) {
      src = URL.createObjectURL(file.originFileObj);
    }

    if (file.type === "application/pdf") {
      window.open(src, "_blank");
    } else if (file.type.startsWith("image/")) {
      const imgWindow = window.open("", "_blank");
      imgWindow?.document.write(`<img src="${src}" />`);
    } else {
      message.info("The selected file format cannot be previewed.");
    }
  };

  const resetFields = () => {
    form.setFieldsValue({
      image: undefined,
      prompt: undefined,
      prompt_strength: 0.7,
      guidance_scale: 15,
      num_inference_steps: 50,
    });

    setUploadedImage(null);
    setGeneratedImage(null);
    setFileList([]);
  };

  const onFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const onFinish = (values) => {
    const { image } = values;

    const reader = new FileReader();

    reader.readAsDataURL(image.fileList[0].originFileObj);

    reader.onload = async function () {
      setLoading(true);

      try {
        let imageDataUrl = reader.result;

        const payload = {
          ...values,
          image: imageDataUrl,
        };

        setUploadedImage(imageDataUrl);

        const res = await IMAGE_GENERATION.generateImage(payload);

        setGeneratedImage(res?.data?.output);

        console.log(res);

        setLoading(false);
      } catch (error) {
        message.error("Failed to generate image!");
        console.log(error);
        setLoading(false);
      }
    };
  };

  return (
    <div className="grid h-full gap-4 lg:grid-cols-2">
      <Card
        title="Input"
        size="default"
        type="inner"
        className="w-full h-full drop-shadow-md"
        styles={{
          header: {
            backgroundColor: "#f0f0f0",
          },
        }}
      >
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Item
            label="Image"
            name="image"
            rules={[{ required: true, message: "Please upload an image" }]}
          >
            <Upload
              fileList={fileList}
              maxCount={1}
              accept="image/*"
              onRemove={() => {
                setFileList([]);
              }}
              beforeUpload={(file) => {
                setFileList([file]);
                return false;
              }}
            >
              <Button icon={<UploadOutlined />} block>
                Upload
              </Button>
            </Upload>
          </Item>

          <Item
            label="Prompt"
            name="prompt"
            rules={[{ required: true, message: "Please enter prompt" }]}
          >
            <Input.TextArea rows={4} />
          </Item>

          <Item label="Negative Prompt" name="negative_prompt">
            <Input.TextArea rows={4} />
          </Item>

          <div className="flex items-center w-full gap-2">
            <Item
              label="Prompt Strength"
              name="prompt_strength"
              className="w-full"
            >
              <Slider min={0} max={1} step={0.1} />
            </Item>

            <Tag>{propmtStrength}</Tag>
          </div>

          <div className="flex items-center w-full gap-2">
            <Item
              label="Guidance Scale"
              name="guidance_scale"
              className="w-full"
            >
              <Slider min={1} max={50} />
            </Item>

            <Tag>{guidanceScale}</Tag>
          </div>

          <div className="flex items-center w-full gap-2">
            <Item
              label="Number of inference steps"
              name="num_inference_steps"
              className="w-full"
            >
              <Slider min={1} max={500} />
            </Item>

            <Tag>{numInferenceSteps}</Tag>
          </div>

          <div className="flex items-center w-full gap-2">
            <Button
              className="w-full"
              loading={loading}
              type="primary"
              htmlType="submit"
            >
              {loading ? "Generating Image" : "Generate Image"}
            </Button>

            {generatedImage && (
              <Button
                className="w-full"
                onClick={resetFields}
                type="default"
                htmlType="button"
              >
                Clear
              </Button>
            )}
          </div>
        </Form>
      </Card>

      <Card
        title="Output"
        size="default"
        type="inner"
        className="w-full h-full drop-shadow-md"
        styles={{
          header: {
            backgroundColor: "#f0f0f0",
          },
        }}
      >
        {generatedImage ? (
          <>
            <div>
              <p className="mb-1 font-semibold">Uploaded Image:</p>

              <Image
                src={uploadedImage}
                onError={(e) => {
                  e.target.src =
                    "https://t4.ftcdn.net/jpg/02/51/95/53/360_F_251955356_FAQH0U1y1TZw3ZcdPGybwUkH90a3VAhb.jpg";
                }}
                className="w-full"
              />
            </div>

            <div className="mt-4">
              <p className="mb-1 font-semibold">Generated Image:</p>

              <Image
                src={generatedImage}
                onError={(e) => {
                  e.target.src =
                    "https://t4.ftcdn.net/jpg/02/51/95/53/360_F_251955356_FAQH0U1y1TZw3ZcdPGybwUkH90a3VAhb.jpg";
                }}
                className="w-full"
              />
            </div>
          </>
        ) : (
          <p className="flex items-center justify-center w-full h-full">
            {loading ? "Generating..." : "Fill details to generate image"}
          </p>
        )}
      </Card>
    </div>
  );
};

export default App;
