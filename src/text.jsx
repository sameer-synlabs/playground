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
import { UploadOutlined } from "@ant-design/icons";
import { useForm, useWatch } from "antd/es/form/Form";
import { IMAGE_GENERATION } from "./api/apiService";
import axios from "axios";

const { Item } = Form;

const App = () => {
  const [generatedImage, setGeneratedImage] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form] = useForm();

  const propmtStrength = useWatch("prompt_strength", form);
  const guidanceScale = useWatch("guidance_scale", form);

  const handleImageUpload = async (file) => {
    if (!file) return;

    setImageUploading(true);

    if (file) {
      const payload = {
        image: file.fileList[0]?.originFileObj,
        key: "43a14f236551a5788da36e73b500f7df",
      };

      try {
        const res = await axios({
          method: "POST",
          url: "https://api.imgbb.com/1/upload",
          data: payload,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setImageUrl(res.data.data.url);
        setImageUploading(false);
      } catch (error) {
        console.log(error);
        setImageUploading(false);
        message.error("Failed to upload image");
      }
    }
  };

  useEffect(() => {
    form.setFieldsValue({
      prompt_strength: 0.7,
      guidance_scale: 15,
      num_inference_steps: 50,
    });
  }, []);

  const onFinish = (values) => {
    const { image } = values;

    const reader = new FileReader();

    reader.readAsDataURL(image[0].originFileObj);

    reader.onload = async function () {
      setLoading(true);

      try {
        let imageDataUrl = reader.result;

        const payload = {
          ...values,
          image: imageUrl,
        };

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

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  return (
    <div className="flex items-start min-h-screen gap-4">
      <Card
        title="Image Generation Details"
        size="default"
        type="inner"
        className="w-1/2 h-full drop-shadow-md"
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
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[{ required: true, message: "Please upload an image" }]}
          >
            <Upload
              beforeUpload={() => {
                return false;
              }}
              listType="picture"
              accept="image/*"
              onChange={(file) => {
                handleImageUpload(file);
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

            <Tag>{guidanceScale}</Tag>
          </div>

          <Button
            block
            loading={loading || imageUploading}
            type="primary"
            htmlType="submit"
          >
            {loading ? "Generating Image" : "Generate Image"}
          </Button>
        </Form>
      </Card>

      <Card
        title="Generated Image"
        size="default"
        type="inner"
        className="w-1/2 h-full drop-shadow-md"
        styles={{
          header: {
            backgroundColor: "#f0f0f0",
          },
        }}
      >
        {generatedImage ? (
          <Image
            src={generatedImage}
            onError={(e) => {
              e.target.src =
                "https://t4.ftcdn.net/jpg/02/51/95/53/360_F_251955356_FAQH0U1y1TZw3ZcdPGybwUkH90a3VAhb.jpg";
            }}
            className="w-full"
          />
        ) : (
          <p className="flex items-center justify-center">
            {loading ? "Generating..." : "Fill details to generate image"}
          </p>
        )}
      </Card>
    </div>
  );
};

export default App;
