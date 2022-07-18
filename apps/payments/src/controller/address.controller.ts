import { catchAsync } from "../utils";

interface RequestBody {}

interface PostResponse {}

export const post = catchAsync(async (req, res) => {
  const response: PostResponse = {
    test: "test",
  };

  res.send(response);
});
