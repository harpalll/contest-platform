import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";

type UserRole = "creator" | "contestee";

export const allowedRoles = (allowedRoles: UserRole[]) => {
  return asyncHandler(async (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json(new ApiResponse(false, null, "UNAUTHORIZED"));
    }

    if (!allowedRoles.includes(user.role)) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json(new ApiResponse(false, null, "FORBIDDEN"));
    }

    next();
  });
};
