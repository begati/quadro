import { useModals } from '@mantine/modals';
import { Text } from '@mantine/core';
import { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Route, Routes as RootRoutes, useNavigate } from 'react-router-dom';
import NewProject from './views/pages/newProject/NewProject';
import { setData } from './store/ducks/global.duck';
import Dashboard from './views/pages/dashboard/Dashboard';

const Routes: FC = () => {
  const dispatch = useDispatch();
  const modals = useModals();
  const navigate = useNavigate();

  useEffect(
    () => {
      navigate("/");
      const project = localStorage.getItem("project");
      if (project) {
        modals.openConfirmModal({
          withCloseButton: false,
          closeOnClickOutside: false,
          closeOnEscape: false,
          title: 'Geração em andamento',
          children: <Text size="sm">Existe um projeto em andamento, deseja continuar a geração?</Text>,
          labels: { confirm: 'Continuar', cancel: 'Novo Projeto' },
          onCancel: () => {
            localStorage.removeItem("project");
            navigate("/");
          },
          onConfirm: () => {
            dispatch(setData(JSON.parse(project)));
            navigate("/dashboard");
          },
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <RootRoutes>
      <Route path="/" element={<NewProject />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </RootRoutes>
  );
};

export default Routes;
