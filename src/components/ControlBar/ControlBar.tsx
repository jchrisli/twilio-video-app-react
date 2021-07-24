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

export default function ControlBar() {
  const classes = useStyles();

  return (
    <aside className={clsx(classes.controlBarContainer)}>
      <Map mapParticipantName={'map'}></Map>
    </aside>
  );
}
