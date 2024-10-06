import type { TreeNodeData, TreeProps } from '@douyinfe/semi-ui/lib/es/tree';
import type { FC } from "react";
import { IconFile, IconFolder } from '@douyinfe/semi-icons';
import Tree from '@douyinfe/semi-ui/lib/es/tree';
import { useEffect, useState } from 'react'

export interface TreeBrowserData extends TreeProps {
  fileHandles: (FileSystemDirectoryHandle | FileSystemFileHandle)[],
  registerProject: (handle: FileSystemDirectoryHandle) => void,
}

const TreeBrowser: FC<TreeBrowserData> = (props) => {
  const [fileTreeData, setFileTreeData] = useState<TreeNodeData[]>([])

  const getTreeData = (handles: (FileSystemDirectoryHandle | FileSystemFileHandle)[], key: string = 'root') => {
    return handles.map((handle): TreeNodeData => ({
      key: `${key}/${handle.name}`,
      icon: handle.kind === 'file' ? <IconFile /> : <IconFolder />,
      label: handle.name,
      handle,
      isLeaf: handle.kind === 'file',
    }))
  }

  const updateTreeData = (list: TreeNodeData[], key: string, children: TreeNodeData[]) => {
    return list.map((node): TreeNodeData => {
      if (node.key === key) {
        return { ...node, children };
      }
      if (node.children) {
        return { ...node, children: updateTreeData(node.children, key, children) };
      }
      return node;
    });
  }

  const onLoadData = (data: TreeNodeData | undefined) => {
    if (!data || !data.key) {
      return Promise.resolve();
    }
    const { key, children } = data;
    return new Promise<void>(resolve => {
      const { handle } = data as { handle: FileSystemDirectoryHandle };
      if (!children && handle && handle.kind === 'directory') {
        Array.fromAsync(handle.values()).then((val) =>
          setFileTreeData(origin => updateTreeData(origin, key, getTreeData(val, key)))
        )
      }
      resolve();
    });
  }

  useEffect(() => {
    setFileTreeData(getTreeData(props.fileHandles))
  }, [])

  return (<Tree
    loadData={onLoadData}
    treeData={[...fileTreeData]}
    onDoubleClick={(e, node) => {
      const { handle } = node as { handle: FileSystemDirectoryHandle };
      if (handle.kind !== "directory") return;
      props.registerProject(handle);
    }}
  />)
}

export default TreeBrowser