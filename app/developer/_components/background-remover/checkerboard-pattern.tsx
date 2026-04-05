import { CHECKERBOARD_SIZE } from "./constants"

function CheckerboardPattern() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      width={CHECKERBOARD_SIZE}
      height={CHECKERBOARD_SIZE}
    >
      <rect
        width={CHECKERBOARD_SIZE}
        height={CHECKERBOARD_SIZE}
        fill="#2d333b"
      />
      <rect
        width={CHECKERBOARD_SIZE / 2}
        height={CHECKERBOARD_SIZE / 2}
        fill="#22272e"
      />
      <rect
        x={CHECKERBOARD_SIZE / 2}
        y={CHECKERBOARD_SIZE / 2}
        width={CHECKERBOARD_SIZE / 2}
        height={CHECKERBOARD_SIZE / 2}
        fill="#22272e"
      />
    </svg>
  )
}

export default CheckerboardPattern
