import React, { useState } from 'react';
import { useEffect } from 'react';
import useParticipants from '../../../hooks/useParticipants/useParticipants';
//import usePublications from '../../../hooks/usePublications/usePublications';
import ParticipantTracks from '../../ParticipantTracks/ParticipantTracks';

// Asteroids
import sio from '../../../connection/sio';
import { RemoteParticipant } from 'twilio-video';

interface MapProps {
  mapParticipantName: string;
}

export default function Map({ mapParticipantName }: MapProps) {
  const participants = useParticipants();
  const [mapParticipant, setMapParticipant] = useState<RemoteParticipant | null>(null);

  //let mapParticipant;
  // Find the map participant based on name
  useEffect(() => {
    const mapParticpants = participants.filter(p => p.identity === mapParticipantName);
    if (participants.length > 0) {
      setMapParticipant(mapParticpants[0]);
    }
  }, [participants, mapParticipantName]);

  const mainFrameOnClick = function(e: React.MouseEvent) {
    let clickMsg = {
      x: e.clientX,
      y: e.clientY,
      w: (e.target as Element).clientWidth,
      h: (e.target as Element).clientHeight,
    };
    console.log(`Clicked ${clickMsg.x} ${clickMsg.y} on ${clickMsg.w} and ${clickMsg.h}`);
    sio.emit('pinpoint', clickMsg);
  };

  // return null if no map participant?
  return mapParticipant ? (
    <div onClick={mainFrameOnClick}>
      <ParticipantTracks participant={mapParticipant} />
    </div>
  ) : //videoOnly={videoOnly}
  //enableScreenShare={enableScreenShare}
  //isLocalParticipant={isLocalParticipant}
  null;
}
