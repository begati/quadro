import React, { FC } from 'react';
import { ColorInput, Grid, TextInput, Title, Button, Group, Tooltip, Select } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form/lib/use-form';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { GripVertical, Trash, Plus } from 'tabler-icons-react';
import { TrackItem } from '../../../model/trackItem';
import { AlbumData } from '../../../model/albumData';

interface DashboardAlbumPanelProps {
  form: UseFormReturnType<AlbumData>;
}

const DashboardAlbumPanel: FC<DashboardAlbumPanelProps> = ({ form }) => {

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

  return (
    <>
      <Grid>
        <Grid.Col>
          <Select
            placeholder="Layout"
            label="Layout:"
            required={true}
            data={form.values.templates || []}
            {...form.getInputProps('template')}
          />
        </Grid.Col>
      </Grid>
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
    </>
  );
};

export default DashboardAlbumPanel;
