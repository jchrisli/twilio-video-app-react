import React, { useRef, useEffect } from 'react';
import { IVideoTrack } from '../../types';
import { styled } from '@material-ui/core/styles';
import { Track } from 'twilio-video';
import useMediaStreamTrack from '../../hooks/useMediaStreamTrack/useMediaStreamTrack';
import useVideoTrackDimensions from '../../hooks/useVideoTrackDimensions/useVideoTrackDimensions';
import { isMobile } from '../../utils';

interface VideoTrackProps {
  track: IVideoTrack;
  isLocal?: boolean;
  priority?: Track.Priority | null;
  rotate?: boolean;
}

export default function VideoTrack({ track, isLocal, priority, rotate }: VideoTrackProps) {
  const Video = styled('video')({
    width: isMobile && isLocal ? '200%' : '100%',
    height: isMobile && isLocal ? '200%' : '100%',
    flex: 1,
    justifyContent: 'stretch',
    objectFit: 'contain',
    alignSelf: 'stretch',
    resizeMode: 'cover',
  });
  const ref = useRef<HTMLVideoElement>(null!);
  const mediaStreamTrack = useMediaStreamTrack(track);
  const dimensions = useVideoTrackDimensions(track);
  const isPortrait = (dimensions?.height ?? 0) > (dimensions?.width ?? 0);
  const rotateVideo = rotate ? true : false;

  useEffect(() => {
    const el = ref.current;
    el.muted = true;
    if (track.setPriority && priority) {
      track.setPriority(priority);
    }
    track.attach(el);
    return () => {
      track.detach(el);
      if (track.setPriority && priority) {
        // Passing `null` to setPriority will set the track's priority to that which it was published with.
        track.setPriority(null);
      }
    };
  }, [track, priority]);

  // The local video track is mirrored if it is not facing the environment.
  const isFrontFacing = mediaStreamTrack?.getSettings().facingMode !== 'environment';
  const style = {
    //transform: isLocal && isFrontFacing ? 'rotateY(180deg)' : '',
    transform: rotateVideo ? 'rotate(0.5turn)' : '',
    objectFit: isPortrait || track.name.includes('screen') ? ('contain' as const) : ('cover' as const),
    height: '200%',
    //objectFit: isPortrait || track.name.includes('screen') ? ('contain' as const) : ('fill' as const),
  };

  return <Video ref={ref} style={style} />;
}
