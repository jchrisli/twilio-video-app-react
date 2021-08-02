import React from 'react';
import clsx from 'clsx';
import { makeStyles, Theme } from '@material-ui/core';
import ParticipantList from '../ParticipantList/ParticipantList';
import ParticipantList1 from '../ParticipantList/ParticipantList1';
import ParticipantList2 from '../ParticipantList/ParticipantList2';
import MainParticipant from '../MainParticipant/MainParticipant';
import ControlBar from '../ControlBar/ControlBar';
import { isMobile } from '../../utils';
import { AutorenewTwoTone } from '@material-ui/icons';

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
      // [theme.breakpoints.down('sm')]:
      // isMobile ? 'default' : {
      //   gridTemplateColumns: `100%`,
      //   gridTemplateRows: `calc(100% - ${totalMobileSidebarHeight}) ${totalMobileSidebarHeight}`,
      // },
    },
    containerMobile: {
      position: 'relative',
      // height: '100%',
      display: 'grid',
      alignItems: 'center',
      // gridTemplateColumns: `repeat(auto-fit, minmax(100px, 2fr))` ,
      // gridTemplateRows: '100%',
      columns: '2 auto',
    },
  };
});

export default function Room() {
  const classes = useStyles();
  if (isMobile) {
    return (
      <div className={clsx(classes.containerMobile)}>
        <ParticipantList />
      </div>
    );
  } else {
    return (
      <div className={clsx(classes.container)}>
        <MainParticipant />
        <ParticipantList />
        <ControlBar />
      </div>
    );
  }
}
