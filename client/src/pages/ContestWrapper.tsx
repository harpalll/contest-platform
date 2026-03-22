import React from 'react';
import useAuthStore from '../store/authStore';
import ContestDetail from './ContestDetail';
import ViewContest from './ViewContest';

const ContestWrapper = () => {
  const { user } = useAuthStore();

  if (user?.role === 'creator') {
    return <ContestDetail />;
  }

  // Contestee or fallback
  return <ViewContest />;
};

export default ContestWrapper;
