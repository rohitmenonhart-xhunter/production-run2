declare module 'pdf-parse' {
  function parse(dataBuffer: Buffer): Promise<{ text: string }>;
  export default parse;
} 