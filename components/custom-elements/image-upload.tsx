"use client";

import type React from "react";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import styles from "./image-upload.module.css";

interface ImageUploadProps {
  id: string;
  center?: boolean;
  errorText?: string;
  onInput: (id: string, file: File | undefined, isValid: boolean) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  id,
  center,
  errorText,
  onInput,
}) => {
  const [file, setFile] = useState<File | undefined>();
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [isValid, setIsValid] = useState(false);

  const filePickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file) {
      return;
    }
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result as string);
    };
    fileReader.readAsDataURL(file);
  }, [file]);

  const pickedHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    let pickedFile: File | undefined;
    let fileIsValid = isValid;
    if (event.target.files && event.target.files.length === 1) {
      pickedFile = event.target.files[0];
      setFile(pickedFile);
      setIsValid(true);
      fileIsValid = true;
    } else {
      setIsValid(false);
      fileIsValid = false;
    }
    onInput(id, pickedFile, fileIsValid);
  };

  const pickImageHandler = () => {
    filePickerRef.current?.click();
  };

  return (
    <div className={center ? styles.container : ""}>
      <input
        id={id}
        ref={filePickerRef}
        className={styles.hiddenInput}
        type="file"
        accept=".jpg,.png,.jpeg"
        onChange={pickedHandler}
      />
      <div className={styles.uploadArea}>
        {previewUrl && (
          <div className={styles.previewContainer}>
            <Image
              src={previewUrl || "/placeholder.svg"}
              alt="Preview"
              className={styles.previewImage}
              height={200}
              width={200}
            />
          </div>
        )}
        <button
          type="button"
          onClick={pickImageHandler}
          className={styles.pickButton}
        >
          Pick Image
        </button>
        {!isValid && errorText && (
          <p className={styles.errorText}>{errorText}</p>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
