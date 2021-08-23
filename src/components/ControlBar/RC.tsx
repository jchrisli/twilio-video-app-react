import { styled } from '@material-ui/core';
import React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import TurnLeft from '../../icons/TurnLeft';
import TurnRight from '../../icons/TurnRight';
import GoForward from '../../icons/GoForward';
import GoBackwards from '../../icons/GoBackwards';

interface RCProps {
  onForward: (e: React.MouseEvent) => void;
  onBackward: (e: React.MouseEvent) => void;
  onLeft: (e: React.MouseEvent) => void;
  onRight: (e: React.MouseEvent) => void;
  onStop: (e: React.MouseEvent) => void;
}

const IconContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  // flexGrow:1,
  // alignItems: 'stretch',

  padding: '6px',
  // resizeMode: 'contain'
  // marginRight: '0.3em',
});

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    containerItem: {
      display: 'flex',
      justifyContent: 'center',
      // flexGrow:1,
      // alignItems: 'stretch',
      width: '25%',
      height: '25%',
      aspectRatio: '1',
      padding: '6px',
    },
    //guideContainter: {
    //display: 'flex',
    //justifyContent: 'center',
    //width: '100%',
    //}
  })
);

export default function RC(props: RCProps) {
  const classes = useStyles();
  return (
    <>
      <IconContainer>
        <div className={classes.containerItem} onMouseDown={props.onForward} onMouseUp={props.onStop}>
          <GoForward />
        </div>
      </IconContainer>
      <IconContainer>
        <div className={classes.containerItem} onMouseDown={props.onLeft} onMouseUp={props.onStop}>
          <TurnLeft />
        </div>
        <div className={classes.containerItem} onMouseDown={props.onBackward} onMouseUp={props.onStop}>
          <GoBackwards />
        </div>
        <div className={classes.containerItem} onMouseDown={props.onRight} onMouseUp={props.onStop}>
          <TurnRight />
        </div>
      </IconContainer>
    </>
  );
}
