import React, { useState } from "react";
import styled from "styled-components";
import { GeometryFlow } from "../projects/geoNodes/GeoFlow";
import SideMenu from "../projects/projectChatWindow/SideMenuBar/SideMenuBar";
import VersionFlowVisualization from "../projects/versionNodes/VersionFlow";
import SortingModal, {
  SortOrder,
  SortingConfig,
} from "../projects/sorting/SortingModal";
import { Activity, Archive, Tag } from "lucide-react";

export default function MecadoTests() {
  const [sortConfig, setSortConfig] = useState<SortingConfig | null>(null);

  const handleConfirm = (config: SortingConfig) => {
    setSortConfig(config);
    // For now: just log. Later, use `config` to re-sort items in this view.
    console.log("Confirmed sort:", config); // { id: 'status', order: 'asc' | 'desc' }
  };

  return (
    <Container>
      <SideMenu />
      {/* <GeometryFlow /> */}
      {/* <VersionFlowVisualization /> */}


      <ModalDock>
        <SortingModal
          items={[
            { id: "mass", label: "Mass", icon: Activity },
            { id: "mos", label: "MoS", icon: Archive },
            { id: "status", label: "Status", icon: Tag },
          ]}
          defaultSelectedId="status"
          defaultOrder={"asc" as SortOrder}
          onChangeSelected={(id) => console.log("Selected option:", id)}
          onChangeOrder={(order) => console.log("Order changed:", order)}
          onConfirm={handleConfirm}
          title="Sort by"
          confirmLabel="Apply Sort"
        />
      </ModalDock>

      {sortConfig && (
        <Debug>
          Active Sort → <b>{sortConfig.id}</b> ({sortConfig.order})
        </Debug>
      )}
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  height: 100%;
  width: 100%;
  background: var(--bg-secondary);
`;

const ModalDock = styled.div`
  display: flex;
  padding: 20px;
  align-items: flex-start;
  justify-content: flex-start;
  background: var(--bg-primary);
`;

const Debug = styled.div`
  grid-column: 1 / -1;
  padding: 12px 16px;
  border-top: 1px solid var(--border-bg);
  color: var(--text-muted);
  background: var(--bg-primary);
`;
