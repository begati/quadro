import React, { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { ColorInput, Grid, TextInput, Title, Button, Group, ScrollArea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Data } from '../../../model/data';

import './Dashboard.scss';
import { TrackItem } from '../../../model/trackItem';

const Dashboard: FC = () => {
  const data = useSelector<RootState, Data | null>(state => state.global.data);

  const form = useForm<Data>({
    initialValues: {}
  });

  useEffect(
    () => {
      if (data) {
        form.setValues(data);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onChangeColor = (index: number, color: string) => {
    if (form.values.colors) {
      form.setFieldValue('colors', form.values.colors.map((v, i) => i === index ? color : v));
    }
  };

  const onChangeTrackName = (index: number, event: any) => {
    let items: TrackItem[] = [];

    if (form.values.tracks && form.values.tracks.items) {
      items = form.values.tracks.items.map((it, i) => i === index ? {... it, name: event.target.value } : it);
    }

    form.setFieldValue('tracks', { ...form.values.tracks, items });
  };

  return (
    <div className="dashboard">
      <div className="panel">
        <Grid>
          <Grid.Col span={8}>
            <Title order={3}>Configurações</Title>
          </Grid.Col>
          <Grid.Col span={4}>
            <Group position="right">
              <Button size="xs" mr={14}>Salvar</Button>
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
            <Title order={3} mt={20} mb={10}>Cores</Title>
            {form.values.colors?.map((color, index) => (
              <Grid>
                <Grid.Col>
                  <ColorInput placeholder="Pick color" format="hex" value={color} onChange={onChangeColor.bind(null, index)} />
                </Grid.Col>
              </Grid>
            ))}
            <Title order={3} mt={20} mb={10}>Faixas</Title>
            {form.values.tracks?.items && form.values.tracks?.items.map((track, index) => (
              <Grid>
                <Grid.Col>
                  <TextInput value={track.name} onChange={onChangeTrackName.bind(null, index)} />
                </Grid.Col>
              </Grid>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Dashboard;
