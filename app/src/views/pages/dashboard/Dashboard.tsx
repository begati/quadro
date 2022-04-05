import React, { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { ColorInput, Grid, TextInput, Title, Button, Group, ScrollArea, Tooltip, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Data } from '../../../model/data';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { GripVertical, Trash, Plus } from 'tabler-icons-react';
import { TrackItem } from '../../../model/trackItem';
import { setData } from '../../../store/ducks/global.duck';
import { useNavigate } from 'react-router-dom';
import { useModals } from '@mantine/modals';

import './Dashboard.scss';
import { http } from '../../../services/http.service';

const Dashboard: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const modals = useModals();

  const data = useSelector<RootState, Data | null>(state => state.global.data);
  const form = useForm<Data>({ initialValues: {} });

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

  const onChangeColor = (index: number, color: string) => {
    if (form.values.colors) {
      form.setFieldValue('colors', form.values.colors.map(
        (it, i) => i === index ? color : it)
      );
    }
  };

  const onChangeTrackName = (index: number, event: any) => {
    if (form.values.tracks) {
      form.setFieldValue('tracks', form.values.tracks.map(
        (it, i) => i === index ? {... it, name: event.target.value } : it)
      );
    }
  };

  const addTrack = () => {
    let tracks: TrackItem[] = [];

    if (form.values.tracks) {
      tracks = [...form.values.tracks];
    }

    tracks.push({ index: tracks.length + 1, name: '' });
    form.setFieldValue('tracks', tracks);
  };

  const removeTrack = (index: number) => {
    let tracks: TrackItem[] = [];

    if (form.values.tracks) {
      tracks = [...form.values.tracks];
    }

    tracks.splice(index, 1);
    form.setFieldValue('tracks', tracks.map((it, index) => ({ ...it, index: index + 1 })));
  };

  const onDragEnd = ({ source: { index: source }, destination: { index: dest } }: any) => {
    let tracks: TrackItem[] = [];

    if (form.values.tracks) {
      tracks = [...form.values.tracks];
    }

    const item = tracks.splice(source, 1);
    tracks.splice(dest, 0, ...item);
    form.setFieldValue('tracks', tracks.map((it, index) => ({ ...it, index: index + 1 })));
  };

  const cancel = () => {
    dispatch(setData(null));
    localStorage.removeItem('project');
    navigate('/');
  };

  const update = async (values: any) => {
    console.log(values);
    try {
      setLoading(true);
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

  return (
    <div className="dashboard">
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
            <Grid>
              <Grid.Col>
                <TextInput placeholder="Album" label="Titulo do album:" required={true} {...form.getInputProps('name')} />
              </Grid.Col>
            </Grid>
            <Grid>
              <Grid.Col>
                <TextInput placeholder="Artista" label="Artista:" required={true} {...form.getInputProps('artist')} />
              </Grid.Col>
            </Grid>
            <Grid>
              <Grid.Col>
                <TextInput placeholder="Capa" label="Capa do Album:" required={true} {...form.getInputProps('cover')} />
              </Grid.Col>
            </Grid>
            <Grid>
              <Grid.Col>
                <TextInput placeholder="DD/MM/YYYY" label="Data de Lançamento:" required={true} {...form.getInputProps('release')} />
              </Grid.Col>
            </Grid>
            <Grid>
              <Grid.Col>
                <TextInput placeholder="Copyrights" label="Copyrights:" required={true} {...form.getInputProps('copyrights')} />
              </Grid.Col>
            </Grid>
            <Grid>
              <Grid.Col>
                <TextInput placeholder="1000" label="Duração (em segundos):" required={true} {...form.getInputProps('duration')} />
              </Grid.Col>
            </Grid>
            <Title order={3} mt={20} mb={10}>Cores</Title>
            {form.values.colors?.map((color, index) => (
              <Grid key={index}>
                <Grid.Col>
                  <ColorInput placeholder="Pick color" format="hex" value={color} onChange={onChangeColor.bind(null, index)} />
                </Grid.Col>
              </Grid>
            ))}
            <Title order={3} mt={20} mb={10}>Faixas</Title>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="tracks" direction="vertical">
                {provided => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {form.values.tracks?.map((track, index) => (
                      <Draggable key={index} index={index} draggableId={index.toString()}>
                        {dragProvided => (
                          <Group ref={dragProvided.innerRef} mt="xs" grow={true} {...dragProvided.draggableProps}>
                            <Grid columns={24}>
                              <Grid.Col span={2} mt={8} {...dragProvided.dragHandleProps}>
                                <GripVertical size={18} />
                              </Grid.Col>
                              <Grid.Col span={20}>
                                <TextInput value={track.name} onChange={onChangeTrackName.bind(null, index)} />
                              </Grid.Col>
                              <Grid.Col span={2} mt={3}>
                                <Tooltip label="Remover esta faixa" withArrow={true} position="right" placement="center">
                                  <Button color="red" size="xs" pl={8} pr={8} onClick={removeTrack.bind(null, index)}>
                                    <Trash size={18} />
                                  </Button>
                                </Tooltip>
                              </Grid.Col>
                            </Grid>
                          </Group>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <Button fullWidth={true} leftIcon={<Plus />} mt={15} mb={20} onClick={addTrack}>
              Adicionar Faixa
            </Button>
          </div>
        </ScrollArea>
      </div>
      <div className="preview">
        <div className="wrapper">
          {image && <img src={image} />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
