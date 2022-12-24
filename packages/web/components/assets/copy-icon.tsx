import classNames from "classnames";
import { FunctionComponent } from "react";

export const CopyIcon: FunctionComponent<{
  classes?: Partial<Record<"container" | "backCube" | "frontCube", string>>;
  /**
   * Container must have 'group' class
   */
  isAnimated?: boolean;
}> = ({ classes, isAnimated }) => {
  const _classes: typeof classes = isAnimated
    ? {
        ...classes,
        container: classNames("group text-inherit", classes?.container),
        backCube: classNames(
          "transform transition-transform duration-150 ease-in",
          "group-hover:-translate-x-[1px] group-hover:-translate-y-[1px] group-hover:stroke-[2.5]",
          classes?.backCube
        ),
        frontCube: classNames(
          "transform transition-transform duration-150 ease-in",
          "group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:stroke-[2.5]",
          classes?.frontCube
        ),
      }
    : classes;

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={_classes?.container}
    >
      <path
        d="M20 9H11C9.89543 9 9 9.89543 9 11V20C9 21.1046 9.89543 22 11 22H20C21.1046 22 22 21.1046 22 20V11C22 9.89543 21.1046 9 20 9Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={_classes?.frontCube}
      />
      <path
        d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={_classes?.backCube}
      />
    </svg>
  );
};
