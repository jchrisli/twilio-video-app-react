import React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import Map from './Map/Map';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    controlBarContainer: {
      gridArea: '1 / 3 / 1 / 4',
      background: '#FFFFFF',
      zIndex: 9,
      display: 'flex',
      flexDirection: 'column',
      borderLeft: '1px solid #E4E7E9',
      [theme.breakpoints.down('sm')]: {
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        zIndex: 100,
      },
    },
    // Do not hide for now
    // hide: {
    //   display: 'none',
    // },
  })
);

// In this component, we are toggling the visibility of the ChatWindow with CSS instead of
// conditionally rendering the component in the DOM. This is done so that the ChatWindow is
// not unmounted while a file upload is in progress.

export default function ControlBar() {
  const classes = useStyles();
  //const { isChatWindowOpen, messages, conversation } = useChatContext();

  return (
    //<aside className={clsx(classes.chatWindowContainer, { [classes.hide]: !isChatWindowOpen })}>
    <aside className={clsx(classes.controlBarContainer)}>
      <Map mapParticipantName={'map'}></Map>
    </aside>
  );
}
