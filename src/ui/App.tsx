import * as React from "react";
import { FiberMapsContextProvider } from "./utils/fiber-maps";
import { EventsContextProvider } from "./utils/events";
import { SourceLocationsContextProvider } from "./utils/source-locations";
import { OpenFileContextProvider } from "./utils/open-file";
import { SelectionContextProvider } from "./utils/selection";
import { PinnedContextProvider } from "./utils/pinned";
import {
  ReactRenderersContextProvider,
  useReactRenderers,
} from "./utils/react-renderers";
import StatusBar from "./components/statusbar/StatusBar";
import WaitingForReady from "./components/misc/WaitingForReady";
import WaitingForRenderer from "./components/misc/WaitingForRenderer";
import AppBar from "./components/appbar/AppBar";
import { AppPageId, pages } from "./pages";

function App() {
  return (
    <SourceLocationsContextProvider>
      <OpenFileContextProvider>
        <ReactRenderersContextProvider>
          <WaitingForRenderer>
            <ReactRendererUI />
          </WaitingForRenderer>
        </ReactRenderersContextProvider>
      </OpenFileContextProvider>
    </SourceLocationsContextProvider>
  );
}

function ReactRendererUI() {
  const { selected: renderer } = useReactRenderers();

  const reactRendererUI = React.useMemo(
    () =>
      renderer && (
        <FiberMapsContextProvider key={renderer.id}>
          <EventsContextProvider channelId={renderer.channelId}>
            <SelectionContextProvider>
              <PinnedContextProvider>
                <Layout />
              </PinnedContextProvider>
            </SelectionContextProvider>
          </EventsContextProvider>
        </FiberMapsContextProvider>
      ),
    [renderer]
  );

  if (reactRendererUI) {
    return reactRendererUI;
  }

  return null;
}

function Layout() {
  const [page, setPage] = React.useState<AppPageId>("component-tree");
  const PageContent = pages[page].content;

  return (
    <div className="app">
      <AppBar pages={pages} page={page} setPage={setPage} />

      <WaitingForReady>
        <PageContent />
      </WaitingForReady>

      <StatusBar />
    </div>
  );
}

export default App;
