declare module 'react-native-html-to-pdf' {
  interface HTMLToPDFOptions {
    html: string;
    fileName?: string;
    directory?: string;
  }

  interface HTMLToPDFResponse {
    filePath: string;
  }

  export default {
    convert(options: HTMLToPDFOptions): Promise<HTMLToPDFResponse>;
  };
} 