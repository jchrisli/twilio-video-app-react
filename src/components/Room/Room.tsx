import React from 'react';
import clsx from 'clsx';
import { makeStyles, Theme } from '@material-ui/core';
import ParticipantList from '../ParticipantList/ParticipantList';
import MainParticipant from '../MainParticipant/MainParticipant';
import ControlBar from '../ControlBar/ControlBar';

const useStyles = makeStyles((theme: Theme) => {
  const totalMobileSidebarHeight = `${theme.sidebarMobileHeight +
    theme.sidebarMobilePadding * 2 +
    theme.participantBorderWidth}px`;
  return {
    container: {
      position: 'relative',
      height: '100%',
      display: 'grid',
      gridTemplateColumns: `1fr ${theme.sidebarWidth}px 400px`,
      gridTemplateRows: '100%',
      // We should not show the control bar on mobile phones (maybe the following CSS is already doing that?)
      [theme.breakpoints.down('sm')]: {
        gridTemplateColumns: `100%`,
        gridTemplateRows: `calc(100% - ${totalMobileSidebarHeight}) ${totalMobileSidebarHeight}`,
      },
    },
  };
});

export default function Room() {
  const classes = useStyles();
  return (
    <div className={clsx(classes.container)}>
      <MainParticipant />
      <ParticipantList />
      <ControlBar />
    </div>
  );
}
