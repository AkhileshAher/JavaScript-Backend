import { isValidObjectId } from "mongoose";
import { ApiError } from "./ApiError.js";

function validObjectIdCheck(id, status = 400, message = "Invalid ObjectId") {
      if (!isValidObjectId(id)) {
            throw new ApiError(status, message.toString());
      }
}

export { validObjectIdCheck };
