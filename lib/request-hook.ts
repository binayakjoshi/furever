"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export type ErrorType = {
  title?: string;
  message: string;
};

export type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type UseHttpReturn<T> = {
  isLoading: boolean;
  error: ErrorType | null;
  sendRequest: (
    url: string,
    method?: RequestMethod,
    body?: BodyInit | null,
    headers?: HeadersInit
  ) => Promise<T>;
  clearError: () => void;
};

export const useHttp = <T = unknown>(): UseHttpReturn<T> => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<ErrorType | null>(null);
  const abortControllers = useRef<AbortController[]>([]);

  const sendRequest = useCallback(
    async (
      url: string,
      method: RequestMethod = "GET",
      body: BodyInit | null = null,
      headers: HeadersInit = {}
    ): Promise<T> => {
      setIsLoading(true);
      const controller = new AbortController();
      abortControllers.current.push(controller);

      try {
        const response = await fetch(url, {
          method,
          body,
          headers,
          signal: controller.signal,
        });

        const data: T = await response.json();

        if (!response.ok) {
          const message =
            (data as { message?: string }).message ?? "Request failed";
          throw new Error(message);
        }

        return data;
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          console.log("Request aborted");
        } else if (err instanceof Error) {
          setError({ title: "Error", message: err.message });
        } else {
          setError({ title: "Error", message: "An unexpected error occurred" });
        }
        throw err;
      } finally {
        abortControllers.current = abortControllers.current.filter(
          (c) => c !== controller
        );
        setIsLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      abortControllers.current.forEach((c) => c.abort());
    };
  }, []);

  return {
    isLoading,
    error,
    sendRequest,
    clearError,
  };
};
