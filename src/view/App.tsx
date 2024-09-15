import { FC, useEffect } from 'react';
import './App.css';
import { useDark } from './dark';
import { Button, List, Modal, Tree, Typography } from '@douyinfe/semi-ui';
import { IconFile, IconFolder } from '@douyinfe/semi-icons';
import { match } from 'ts-pattern';
import { useQuery } from 'react-query';
import { ProjectRecord } from '../idl';
import { TreeNodeData } from '@douyinfe/semi-ui/lib/es/tree';
import { useServiceWorker } from '../base/hooks/serviceWorker';

const { Text } = Typography;

const isSupportLocalFS = "showDirectoryPicker" in window;

const App: FC = () => {
  useDark();

  const serviceWorker = useServiceWorker("./service-worker.js", {
    scope: window.location.pathname,
    type: "module",
  });

  const projectListQuery = useQuery([], async () => {
    await navigator.serviceWorker.ready;
    return fetch("./api/projectList").then(e => e.json());
  });

  const projectList: [ProjectRecord, boolean][] = projectListQuery.data?.data ?? [];

  const openProject = (id: number) => {
    window.open(`./tower/${id}/`, "_blank");
  }

  useEffect(() => {
    const onMessage = (e: MessageEvent<[string, ...any]>) => {
      const [op, ...params] = e.data;
      match(op)
        .with("register", "project.register", () => {
          const [id] = params;
          openProject(id);
          projectListQuery.refetch();
        });
    };
    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, []);

  const registerProject = (handle: FileSystemDirectoryHandle) => {
    serviceWorker.controller?.postMessage(["register", handle]);
  }

  const forgetProject = (id: number) => {
    serviceWorker.controller?.postMessage(["project.forget", id]);
  }

  const openLocalProject = async () => {
    try {
      const handle = await window.showDirectoryPicker({
        id: "mota-service-worker",
        mode: "readwrite",
      });
      const fileHandles = await Array.fromAsync(handle.values());
      if (!fileHandles.some((e) => e.kind === "file" && e.name === "index.html")) {
        const fileTreeData = fileHandles.map((handle): TreeNodeData => ({
          key: handle.name,
          icon: handle.kind === "file" ? <IconFile /> : <IconFolder />,
          label: handle.name,
          handle,
          isLeaf: handle.kind === "file",
        }));
        const changeOne = () => {
          modal.destroy();
          openLocalProject(); 
        }
        const modal = Modal.confirm({
          content: (
            <div>
              <p>文件夹{handle.name}可能不是一个工程，是否选择错了？</p>
              <p>你可以<Text link onClick={changeOne}>换一个</Text>, 或者双击选择它的子文件夹</p>
              <Tree
                treeData={fileTreeData}
                onDoubleClick={(e, node) => {
                  const { handle } = node as { handle: FileSystemDirectoryHandle };
                  if (handle.kind !== "directory") return;
                  modal.destroy();
                  registerProject(handle);
                }}
              />
            </div>
          ),
          okText: "坚持打开",
          onOk: () => {
            registerProject(handle);
          },
          cancelText: "取消",
        })
        return;
      }
      registerProject(handle);
    } catch {
      //
    }
  }

  return (
    <div>
      <div>
        <h2>Mota Service Worker</h2>
        <h2>在线版启动服务</h2>
      </div>
      <div>
        {isSupportLocalFS ? (
          <Button loading={!serviceWorker.isReady} onClick={openLocalProject}>{serviceWorker.isReady ? "打开本地工程" : "启动服务加载中"}</Button>
        ) : (
          <p>你的浏览器不支持读写本地文件，请使用最新的桌面版 Chrome / Edge</p>
        )}
      </div>
      <div>
        <h3>历史记录</h3>
        <List loading={projectListQuery.isLoading}>
          {projectList.map(([{ id, name, handle }, actived]) => (
            <List.Item
              key={id}
              main={<span>{`[${id}] ${name}`}</span>}
              extra={
                <Text
                  link={{ href: `./tower/${id}/`, target: "_blank" }}
                  onClick={async (e) => {
                    if (actived) return;
                    e.preventDefault();
                    openProject(id);
                    // const state = await handle.queryPermission({ mode: "readwrite" });
                    // if (state === "denied") {
                    //   forgetProject(id);
                    //   return;
                    // }
                    // const newState = await handle.requestPermission({ mode: "readwrite" });
                    // match(newState)
                    //   .with("granted", () => {
                    //     openProject(id);
                    //   })
                    //   .with("prompt", () => {
                    //     // 什么都不做
                    //   })
                    //   .with("denied", () => {
                    //     forgetProject(id);
                    //   });
                  }}
                >打开</Text>
              }
            />
          ))}
        </List>
      </div>
    </div>
  )
}

export default App
