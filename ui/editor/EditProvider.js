import {createContext, useContext, useEffect, useState} from "react";
import {Permission, useAuth} from "../../auth/AuthProvider";

export const EditContext = createContext({
  canEdit: false,
});

export default function EditProvider(props) {

  const {hasPermission, isAuthenticated} = useAuth();
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      // check admin permissions with auth layer
      console.debug(`Checking admin permission...`);
      hasPermission(Permission.ADMIN).then((res) => {
        console.debug(`Admin permission: ${res}.`);
        setCanEdit(res);
      });
    } else {
      setCanEdit(false);
    }
  }, [hasPermission, setCanEdit, isAuthenticated]);

  return (
    <EditContext value={{
      canEdit: canEdit
    }}>
      {props.children}
    </EditContext>
  )
}

export function useEdit() {
  return useContext(EditContext)
}
