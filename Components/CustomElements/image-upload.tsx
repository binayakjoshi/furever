import React, { useRef, useState, useEffect, ChangeEvent } from "react";
import styles from "./image-upload.module.css";
import Image from "next/image";
import Button from "./button";

interface ImageUploadProps {
  id: string;
  center?: boolean;
  errorText?: string;
  onInput: (id: string, file: File | undefined, isValid: boolean) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  id,
  center = false,
  errorText,
  onInput,
}) => {
  const filePickerRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File>();
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (!file) return;
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result as string);
    };
    fileReader.readAsDataURL(file);
  }, [file]);

  const pickedHandler = (event: ChangeEvent<HTMLInputElement>) => {
    let picked: File | undefined;
    let fileIsValid = isValid;

    if (event.target.files && event.target.files.length === 1) {
      picked = event.target.files[0];
      setFile(picked);
      setIsValid(true);
      fileIsValid = true;
    } else {
      setIsValid(false);
      fileIsValid = false;
    }
    onInput(id, picked, fileIsValid);
  };

  const pickImageHandler = () => {
    filePickerRef.current?.click();
  };

  return (
    <div className={styles["form-control"]}>
      <input
        id={id}
        type="file"
        accept=".jpeg,.png,.jpg"
        style={{ display: "none" }}
        ref={filePickerRef}
        onChange={pickedHandler}
      />
      <div className={`${styles.imageUpload} ${center ? styles.center : ""}`}>
        <div className={styles.preview}>
          {previewUrl ? (
            <Image src={previewUrl} alt="Preview" />
          ) : (
            <p>Please pick an image.</p>
          )}
        </div>
        <Button type="button" onClick={pickImageHandler}>
          Pick Image
        </Button>
      </div>
      {!isValid && errorText && <p>{errorText}</p>}
    </div>
  );
};

export default ImageUpload;
