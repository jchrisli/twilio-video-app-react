import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import PriorityHighIcon from '@material-ui/icons/PriorityHigh';
import Lock from '@material-ui/icons/Lock';
//import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';

interface RobotAvatarProps {
  id: number;
  x: number;
  y: number;
  heading: number;
  hasControl: boolean;
  on: boolean;
  numberUsers: number;
  pinned: boolean;
  spotlighted: boolean;
  handleClick: (e: React.MouseEvent) => void; // Note: does it return void?
}

const useStyles = makeStyles({
  // style rule
  avatarContainer: (props: RobotAvatarProps) => {
    const size = 30;
    return {
      position: 'absolute',
      borderRadius: '50%',
      backgroundColor: props.hasControl ? '#9acd32' : props.on ? '#eb6534' : '#888', // Green if has control, blue if on the robot, grey otherwise
      left: `${props.x - size / 2}px`,
      top: `${props.y - size / 2}px`,
      color: '#eee',
      height: `${size}px`,
      width: `${size}px`,
      fontSize: '16px',
      textAlign: 'center',
    };
  },
  //statusRing: (props: RobotAvatarProps) => {
  //const size = 33;
  //return {
  //position: 'absolute',
  //borderRadius: '50%',
  //borderColor: props.spotlighted ? '#ffbf00' : props.pinned ? '#eb6534' : '#888', // Green if has control, blue if on the robot, grey otherwise
  //backgroundColor: props.hasControl ? '#9acd32' : props.on ? '#eb6534' : '#888', // Green if has control, blue if on the robot, grey otherwise
  //left: `${props.x - size / 2}px`,
  //top: `${props.y - size / 2}px`,
  //color: '#eee',
  //height: `${size}px`,
  //width: `${size}px`,
  //fontSize: '16px',
  //textAlign: 'center',
  //};
  ////   // CSS property
  ////   color: props => props.color,
  //},
  userCountDot: {
    position: 'absolute',
    backgroundColor: 'white',
    height: '4px',
    width: '4px',
    transformOrigin: 'center',
    top: '-2px',
    left: '-2px',
    borderRadius: '50%',
  },
});

export default function RobotAvatar(props: RobotAvatarProps) {
  // How to get my own name?
  // const { room } = useVideoContext();
  // const localName = room!.localParticipant.identity;
  const classes = useStyles(props);
  const userCountDotToCenter = 12;
  const pieSlice = (2 * Math.PI) / 12;

  const toAngle = (a: number) => ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

  //<div className={classes.headingLine}></div>

  return (
    <>
      <div className={classes.avatarContainer} onClick={props.handleClick}>
        {props.spotlighted ? <PriorityHighIcon /> : props.pinned ? <Lock></Lock> : null}
      </div>
      <div>
        {Array.from(Array(props.numberUsers).keys()).map(ind => (
          <div
            className={classes.userCountDot}
            key={ind}
            style={{
              transform: `translate(${props.x +
                userCountDotToCenter *
                  Math.cos(toAngle(props.heading - ((props.numberUsers - 1) / 2 - ind) * pieSlice))}px,
                                                                              ${props.y +
                                                                                userCountDotToCenter *
                                                                                  Math.sin(
                                                                                    toAngle(
                                                                                      props.heading -
                                                                                        ((props.numberUsers - 1) / 2 -
                                                                                          ind) *
                                                                                          pieSlice
                                                                                    )
                                                                                  )}px)`,
            }}
          />
        ))}
      </div>
    </>
  );
}
