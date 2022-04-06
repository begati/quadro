import React, { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { Grid, Title, Button, Group, ScrollArea, Text, LoadingOverlay, Select, Popover } from '@mantine/core';
import { useForm } from '@mantine/form';
import { setData } from '../../../store/ducks/global.duck';
import { useNavigate } from 'react-router-dom';
import { useModals } from '@mantine/modals';
import { http } from '../../../services/http.service';
import DashboardAlbumPanel from './DashboardAlbumPanel';
import { AlbumData } from '../../../model/albumData';
import { TrackData } from '../../../model/trackData';
import DashboardTrackPanel from './DashboardTrackPanel';
import { saveAs } from 'file-saver';

import './Dashboard.scss';

const Dashboard: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const modals = useModals();

  const data = useSelector<RootState, AlbumData | null>(state => state.global.data);
  const form = useForm<AlbumData | TrackData>({ initialValues: {} });

  const [modelOpened, setModelOpened] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);

  useEffect(
    () => {
      if (data) {
        form.setValues(data);
        update(data);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const cancel = () => {
    dispatch(setData(null));
    localStorage.removeItem('project');
    navigate('/');
  };

  const update = async (values: any) => {
    try {
      setLoading(true);

      if (!values) {
        dispatch(setData(form.values));
      }

      const data = await http.post('/preview', values || form.values).then(r => r.data);
      setImage(data.image);
    } catch (e) {
      modals.openModal({
        closeOnEscape: false,
        closeOnClickOutside: false,
        title: 'Erro ao atualizar',
        children: <Text>Não foi possível atualizar os dados, tente novamente.</Text>,
        zIndex: 300,
      });
    }
    setLoading(false);
  };

  const toggleModel = () => setModelOpened(p => !p);

  const generate = async () => {
    try {
      toggleModel();
      setGenLoading(true);

      dispatch(setData(form.values));

      const data = await http.post('/generate', form.values).then(r => r.data);

      var bytes = atob(data.file);

      var ab = new ArrayBuffer(bytes.length);
      var ia = new Uint8Array(ab);

      for (var i = 0; i < bytes.length; i++) {
        ia[i] = bytes.charCodeAt(i);
      }

      saveAs(new Blob([ab], { type: 'application/pdf' }), `${form.values.name}.pdf`);
    } catch (e) {
      modals.openModal({
        closeOnEscape: false,
        closeOnClickOutside: false,
        title: 'Erro ao atualizar',
        children: <Text>Não foi possível gerar o arquivo, tente novamente.</Text>,
        zIndex: 300,
      });
    }
    setGenLoading(false);
  };

  return (
    <div className="dashboard">
      <LoadingOverlay visible={genLoading} />
      <div className="panel">
        <Grid>
          <Grid.Col span={6}>
            <Title order={3}>Configurações</Title>
          </Grid.Col>
          <Grid.Col span={6}>
            <Group position="right">
              <Button size="xs" color="red" onClick={cancel}>Cancelar</Button>
              <Button size="xs" mr={14} onClick={update.bind(null, null)} loading={loading}>Atualizar</Button>
            </Group>
          </Grid.Col>
        </Grid>
        <ScrollArea style={{ width: 474, height: 'calc(100% - 50px)' }} mt={20}>
          <div className="scroll-overflow">
            {form.values.type === 'album' ? <DashboardAlbumPanel form={form} /> : <DashboardTrackPanel form={form} />}
          </div>
        </ScrollArea>
      </div>
      <div className="preview">
        <div className="pdf-button">
          <Group position="right">
            <Popover
              opened={modelOpened}
              onClose={toggleModel}
              position="bottom"
              placement="end"
              title="Modelo do PDF"
              transition="pop-top-right"
              mt={0}
              target={
                <Button fullWidth={true} onClick={toggleModel} mt={0} size="xs">Gerar PDF</Button>
              }
            >
              <Select
                data={[
                  { value: 'A4', label: 'A4 dividido' },
                  { value: 'A3', label: 'A3' },
                ]}
                {...form.getInputProps('model')}
              />
              <Group position="right" mt="sm">
                <Button onClick={generate}>Gerar</Button>
              </Group>
            </Popover>
          </Group>
        </div>
        <div className="wrapper">
          {image && <img src={image} />}
        </div>
        
      </div>
    </div>
  );
};

export default Dashboard;
