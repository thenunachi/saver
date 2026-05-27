import { createContext, useContext, useState, useCallback } from "react";
import ToastContainer from "../components/Toast";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const add = useCallback((message, type = "info", duration = 6000) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-4), { id, message, type, duration }]);
    if (duration > 0) setTimeout(() => remove(id), duration);
    return id;
  }, [remove]);

  return (
    <ToastCtx.Provider value={{ add, remove }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={remove} />
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
