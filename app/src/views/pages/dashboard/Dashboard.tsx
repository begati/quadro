import React, { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';

const Dashboard: FC = () => {
  const data = useSelector<RootState>(state => state.global.data);
  return <>Dashboard</>;
};

export default Dashboard;
