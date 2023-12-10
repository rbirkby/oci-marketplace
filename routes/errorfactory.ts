export default (code: OciErrorCode, message?: string, detail?: string) => ({
  errors: [{ code, message, detail }]
});
