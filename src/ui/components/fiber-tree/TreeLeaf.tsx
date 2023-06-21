import * as React from "react";
import { useFiber, useFiberChildren } from "../../utils/fiber-maps";
import { useTreeViewSettingsContext } from "./contexts";
import TreeLeafCaption from "./TreeLeafCaption";

export interface TreeLeafProps {
  fiberId: number;
  depth?: number;
  expandable?: boolean;
}

const TreeLeaf = React.memo(
  ({ fiberId, depth = 0, expandable = true }: TreeLeafProps) => {
    const { setFiberElement, groupByParent, showUnmounted, showTimings } =
      useTreeViewSettingsContext();
    const fiber = useFiber(fiberId);
    const children = useFiberChildren(fiberId, groupByParent, showUnmounted);
    const [expanded, setExpanded] = React.useState(true);
    const hasChildren = children.length > 0;

    if (!fiber) {
      return null;
    }

    return (
      <div
        className={
          "tree-leaf" +
          (expandable && fiber.ownerId === 0 ? " render-root" : "")
        }
      >
        <TreeLeafCaption
          depth={Math.max(depth - 1, 0)}
          fiber={fiber}
          expanded={expanded}
          setExpanded={hasChildren ? setExpanded : undefined}
          showTimings={showTimings}
          setFiberElement={setFiberElement}
        />

        {expandable &&
          expanded &&
          children.map(childId => (
            <TreeLeaf key={childId} fiberId={childId} depth={depth + 1} />
          ))}
      </div>
    );
  }
);

TreeLeaf.displayName = "TreeLeaf";

export default TreeLeaf;
