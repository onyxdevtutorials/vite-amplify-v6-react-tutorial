import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import ImageUpload from "./ImageUpload";

describe("ImageUpload", () => {
  test("renders the file input", async () => {
    const onFileSelect = vi.fn();
    render(<ImageUpload id="test" onFileSelect={onFileSelect} />);
    const input = screen.getByTestId("test");
    expect(input).toBeInTheDocument();
  });

  test("calls onFileSelect when a file is selected", async () => {
    const user = userEvent.setup();
    const onFileSelect = vi.fn();
    render(<ImageUpload id="test" onFileSelect={onFileSelect} />);
    const input = screen.getByTestId("test");
    await user.upload(
      input,
      new File(["(⌐□_□)"], "chucknorris.png", { type: "image/png" })
    );
    expect(onFileSelect).toHaveBeenCalledWith(expect.any(File));
  });
});
