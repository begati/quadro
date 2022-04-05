import React, { FC } from 'react';
import { ColorInput, Grid, TextInput, Title, Select, Slider, Text, Group } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form/lib/use-form';
import { TrackData } from '../../../model/trackData';
import moment from 'moment';
import { format } from 'path';

interface DashboardTrackPanelProps {
  form: UseFormReturnType<TrackData>;
}

const DashboardTrackPanel: FC<DashboardTrackPanelProps> = ({ form }) => {

  const onChangeColor = (index: number, color: string) => {
    if (form.values.colors) {
      form.setFieldValue('colors', form.values.colors.map(
        (it, i) => i === index ? color : it)
      );
    }
  };

  const formatTime = (value: number) => moment.utc(value * 1000).format('mm:ss');
  const onChangeCurrentTime = (value: number) => form.setFieldValue('current_time', value);

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
          <TextInput placeholder="Titulo" label="Titulo:" required={true} {...form.getInputProps('name')} />
        </Grid.Col>
      </Grid>
      <Grid>
        <Grid.Col>
          <TextInput placeholder="Album" label="Titulo do album:" required={true} {...form.getInputProps('album')} />
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
          <TextInput placeholder="1000" label="Duração (em segundos):" required={true} {...form.getInputProps('duration')} />
        </Grid.Col>
      </Grid>
      <Grid>
        <Grid.Col>
          <Text color="#C1C2C5" size="sm">Tempo Atual:</Text>
        </Grid.Col>
      </Grid>
      <Grid>
        <Grid.Col pl={15} pb={20} pr={20}>
          <Slider
            value={form.values.current_time}
            onChange={onChangeCurrentTime}
            min={0}
            max={form.values.duration}
            label={formatTime}
            marks={[
              { value: 0, label: '0:00' },
              { value: form.values.duration || 0, label: formatTime(form.values.duration || 0) }
            ]}
          />
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
    </>
  );
};

export default DashboardTrackPanel;
