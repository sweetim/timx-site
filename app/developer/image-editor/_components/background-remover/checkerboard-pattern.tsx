import { CHECKERBOARD_SIZE } from "./constants"

const ID = "checkerboard-pattern"

function CheckerboardPattern() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id={ID}
          width={CHECKERBOARD_SIZE}
          height={CHECKERBOARD_SIZE}
          patternUnits="userSpaceOnUse"
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
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill={`url(#${ID})`}
      />
    </svg>
  )
}

export default CheckerboardPattern
