import * as React from "react";
import { useUUID } from "./useUUID.js";
const _React = React;
const useFormId = React.version.split(".")[0] === "17" ? useUUID : _React.useId;
export {
  useFormId
};
//# sourceMappingURL=useFormId.js.map
