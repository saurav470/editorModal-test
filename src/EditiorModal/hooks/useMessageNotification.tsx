import { message } from 'antd';


const useMessageNotification = () => {

  const [messageApi, contextHolder] = message.useMessage();


  const successMessage = (text: string = "") =>
    messageApi.open({ type: "success", content: text, duration: 1.5 });


  const errorMessage = (text: string = "") =>
    messageApi.open({ type: "error", content: text, duration: 1.5 });


  const warningMessage = (text: string = "") =>
    messageApi.open({ type: "warning", content: text, duration: 1.5 });


  const infoMessage = (text: string = "") =>
    messageApi.info(text, 1.5);

  return {
    contextHolder,
    successMessage,
    errorMessage,
    warningMessage,
    infoMessage,
  };
};

export default useMessageNotification;
