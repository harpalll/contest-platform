import { config } from "../../config";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";

export const authMiddleware = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(400).json(new ApiResponse(false, {}, "BAD_REQUEST"));
  }

  const token = authHeader.split(" ")[1];
  const decodedToken: any = jwt.verify(token!, config.JWT_SECRET!);

  if (!decodedToken) {
    return res
      .status(401)
      .json(new ApiResponse(false, {}, "INVALID_ACCESS_TOKEN"));
  }

  const { id, name, role } = decodedToken;
  if ([id, name, role].some((field) => !field)) {
    return res.status(401).json(new ApiResponse(false, {}, "UNAUTHORIZED"));
  }

  req.user = {
    id: id,
    name: name,
    role: role,
  };

  next();
});
