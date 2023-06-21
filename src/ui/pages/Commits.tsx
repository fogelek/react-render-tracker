import * as React from "react";
import { useSelectedId } from "../utils/selection";
import { useCommits } from "../utils/fiber-maps";
import { Commit } from "../../common/consumer-types";
import { Message } from "common-types";
import TreeLeaf from "../components/fiber-tree/TreeLeaf";

function CommitsPageBadge() {
  const commits = useCommits();
  return <span>{commits.length}</span>;
}

function CommitsPageCommitEvent(props: { event: Message }) {
  const { event } = props;
  return (
    <tr>
      <td>{event.id}</td>
      <td>
        <TreeLeaf fiberId={event.fiberId} depth={0} expandable={false} />
      </td>
      <td colSpan={3}>{event.op}</td>
    </tr>
  );
}

function CommitsPageCommit(props: { commit: Commit }) {
  const { commit } = props;
  const [expanded, setExpanded] = React.useState(false);

  const stat = commit.events.reduce((stat, event) => {
    stat[event.op] = (stat[event.op] || 0) + 1;
    return stat;
  }, Object.create(null));
  console.log(commit);

  const toggleExpand = React.useCallback(
    () => setExpanded(state => !state),
    [setExpanded]
  );

  const trigger = commit.start.event.triggers[0];
  const expandClass = expanded ? "expanded" : "collapsed";
  return (
    <>
      <tbody
        id={`commit-${commit.commitId}`}
        className="commit-data"
        onClick={toggleExpand}
      >
        <tr>
          <td>
            <button className={`button-expand ${expandClass}`}></button>
            {commit.commitId}
          </td>
          <td>{stat.mount || ""}</td>
          <td>{stat.update || ""}</td>
          <td>{stat.unmount || ""}</td>
          <td>{`${trigger?.event || ""} ${trigger?.kind || ""}`}</td>
        </tr>
      </tbody>
      {commit.events?.length && (
        <tbody
          key={`events-${commit.commitId}`}
          className={`commit-details ${expandClass}`}
        >
          <tr>
            <th>id</th>
            <th>fiber</th>
            <th colSpan={3}>operation</th>
          </tr>
          {commit.events.map(e => (
            <CommitsPageCommitEvent key={e.id} event={e} />
          ))}
        </tbody>
      )}
    </>
  );
}

function CommitsPage() {
  const { selectedId } = useSelectedId();
  const commits = useCommits().slice(-20).reverse();

  return (
    <div
      className="app-page app-page-commits"
      data-has-selected={selectedId !== null || undefined}
    >
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Mounts</th>
            <th>Updates</th>
            <th>Unmounts</th>
            <th>Trigger</th>
          </tr>
        </thead>
        {commits.map(commit => (
          <CommitsPageCommit key={commit.commitId} commit={commit} />
        ))}
      </table>
    </div>
  );
}

const CommitsPageBadgeMemo = React.memo(CommitsPageBadge);
CommitsPageBadgeMemo.displayName = "CommitsPageBadge";

const CommitsPageMemo = React.memo(CommitsPage);
CommitsPageMemo.displayName = "CommitsPage";

export {
  CommitsPageMemo as CommitsPage,
  CommitsPageBadgeMemo as CommitsPageBadge,
};
