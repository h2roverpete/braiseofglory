import {createContext, useContext} from "react";

const TouchContext = createContext({
  supportsHover: false
});

export default function TouchProvider({children}) {
  return (
    <TouchContext.Provider value={{
      supportsHover: window.matchMedia('(hover: hover)').matches
    }}>
      {children}
    </TouchContext.Provider>
  )
}

export function useTouchContext() {
  return useContext(TouchContext);
}