import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
//import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';

interface RobotAvatarProps {
  id: number;
  x: number;
  y: number;
  heading?: number;
  hasControl: boolean;
  on: boolean;
  numberUsers: number;
  handleClick: (e: React.MouseEvent) => void; // Note: does it return void?
}

const useStyles = makeStyles({
  // style rule
  avatarContainer: (props: RobotAvatarProps) => {
    const size = 30;
    return {
      position: 'absolute',
      borderRadius: '50%',
      backgroundColor: props.hasControl ? '#9acd32' : props.on ? '#21b6a8' : '#888', // Green if has control, blue if on the robot, grey otherwise
      left: `${props.x - size / 2}px`,
      top: `${props.y - size / 2}px`,
      color: '#eee',
      height: `${size}px`,
      width: `${size}px`,
      fontSize: '16px',
      textAlign: 'center',
    };
  },
  // bar: {
  //   // CSS property
  //   color: props => props.color,
  // },
});

export default function RobotAvatar(props: RobotAvatarProps) {
  // How to get my own name?
  // const { room } = useVideoContext();
  // const localName = room!.localParticipant.identity;
  const classes = useStyles(props);

  return (
    <div className={classes.avatarContainer} onClick={props.handleClick}>
      {props.numberUsers}
    </div>
  );
}
