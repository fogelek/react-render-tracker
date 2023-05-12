import * as React from "react";
import { MessageFiber } from "../../types";
import { useSelectionState, useHighlightingState } from "../../utils/selection";
import { usePinnedContext } from "../../utils/pinned";
import TreeLeafTimings from "./TreeLeafTimings";
import TreeLeafCaptionContent from "./TreeLeafCaptionContent";
import { remoteSubscriber } from "../../rempl-subscriber";

interface TreeLeafCaptionProps {
  fiber: MessageFiber;
  depth?: number;
  showTimings: boolean;
  pinned?: boolean;
  expanded?: boolean;
  setExpanded?: (value: boolean) => void;
  setFiberElement?: (id: number, element: HTMLElement | null) => void;
}

interface TreeLeafCaptionContainerProps {
  fiber: MessageFiber;
  depth?: number;
  showTimings: boolean;
  pinned?: boolean;
  content: React.ReactNode;
}

const TreeLeafCaption = ({
  fiber,
  depth = 0,
  showTimings,
  pinned = false,
  expanded = false,
  setExpanded,
  setFiberElement,
}: TreeLeafCaptionProps) => {
  const content = React.useMemo(
    () => (
      <TreeLeafCaptionContent
        fiber={fiber}
        expanded={expanded}
        setExpanded={setExpanded}
        setFiberElement={setFiberElement}
      />
    ),
    [fiber, expanded, setExpanded, setFiberElement]
  );

  return (
    <TreeLeafCaptionContainer
      fiber={fiber}
      depth={depth}
      pinned={pinned}
      showTimings={showTimings}
      content={content}
    />
  );
};

const TreeLeafCaptionContainer = React.memo(
  ({
    fiber,
    depth,
    pinned,
    showTimings,
    content,
  }: TreeLeafCaptionContainerProps) => {
    const { id, ownerId, displayName } = fiber;
    const { selected, select } = useSelectionState(fiber.id);
    const { highlighted } = useHighlightingState(fiber.id);
    const { pin } = usePinnedContext();

    const isRenderRoot = ownerId === 0;
    const classes = ["tree-leaf-caption"];
    for (const [cls, add] of Object.entries({
      selected,
      highlighted,
      pinned,
      "render-root": isRenderRoot,
    })) {
      if (add) {
        classes.push(cls);
      }
    }

    const handleSelect = (event: React.MouseEvent) => {
      event.stopPropagation();
      select(id);
    };
    const handlePin = (event: React.MouseEvent) => {
      event.stopPropagation();
      pin(id);
    };
    const handleMouseEnter = () => {
      const channel = remoteSubscriber.ns("highlighter");
      channel.callRemote("startHighlight", id, displayName);
    }
    const handleMouseLeave = () => {
      const channel = remoteSubscriber.ns("highlighter");
      channel.callRemote("stopHighlight");
    }

    return (
      <div
        className={classes.join(" ")}
        style={{ "--depth": depth } as React.CSSProperties}
        onClick={handleSelect}
        onDoubleClick={handlePin}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {showTimings && <TreeLeafTimings fiber={fiber} />}

        {content}

        {pinned && (
          <button
            className="tree-leaf-caption__unpin-button"
            onClick={event => {
              event.stopPropagation();
              pin(0);
            }}
          >
            Unpin
          </button>
        )}
      </div>
    );
  }
);
TreeLeafCaptionContainer.displayName = "TreeLeafCaptionContainer";

export default TreeLeafCaption;
