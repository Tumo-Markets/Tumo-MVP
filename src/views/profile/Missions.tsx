import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiUrl } from 'src/service/api/apiUrl';
import { axiosClient } from 'src/service/axios';
import { TMission, TMissionDefinitions } from 'src/types/global';
import { toast } from 'react-toastify';
import RoundedCornerButton from 'src/components/Button/RoundedCornerButton';

interface Props {
  userId: string;
  missions: TMission | undefined;
  isLoading: boolean;
}

export default function Missions({ userId, missions, isLoading }: Props) {
  const queryClient = useQueryClient();

  const claimMutation = useMutation({
    mutationFn: async (missionId: string) => {
      const response = await axiosClient.post(apiUrl.claimMission(userId, missionId));
      return response.data;
    },
    onSuccess: () => {
      toast.success('Mission claimed successfully!');
      queryClient.invalidateQueries({ queryKey: ['userMissions', userId] });
      queryClient.invalidateQueries({ queryKey: ['userMetadata', userId] });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to claim mission';
      toast.error(errorMessage);
    },
  });

  const isSocialMission = (mission: TMissionDefinitions) => {
    if (mission.type === 'social') return true;

    // Check if daily mission is social-related
    if (mission.type === 'daily') {
      const name = (mission.mission_name || '').toLowerCase();
      const description = (mission.description || '').toLowerCase();
      const text = `${name} ${description}`;

      return (
        text.includes('twitter') ||
        text.includes('x ') ||
        text.includes(' x') ||
        text.includes('discord') ||
        text.includes('telegram')
      );
    }

    return false;
  };

  const getSocialActionLabel = (description = '') => {
    const d = (description || '').toLowerCase();
    if (d.includes('follow')) return 'Follow';
    if (d.includes('join')) return 'Join';
    return 'Follow';
  };

  const getSocialPlatform = (text: string): 'telegram' | 'twitter' | 'discord' => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('telegram')) return 'telegram';
    if (lowerText.includes('twitter') || lowerText.includes('x ') || lowerText.includes(' x')) return 'twitter';
    if (lowerText.includes('discord')) return 'discord';
    return 'twitter'; // default fallback
  };

  const handleSocialMission = async (missionId: string, description: string) => {
    try {
      const platform = getSocialPlatform(description);
      const response = await axiosClient.get(apiUrl.getSocialUrl(userId, missionId, platform));
      const url = response.data?.url || response.data;

      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
        await claimMutation.mutateAsync(missionId);
      } else {
        toast.error('Social link not available');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to get social link';
      toast.error(errorMessage);
    }
  };

  const handleClaim = async (missionId: string) => {
    claimMutation.mutate(missionId);
  };

  // Filter missions where is_claimed is false
  const unclaimedMissions = missions
    ? Object.entries(missions)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, mission]) => !mission.is_claimed)
        .map(([id, mission]) => ({ id, ...mission }))
    : [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-100 dark:bg-[#1a1a1a] rounded-2xl p-4 space-y-3">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!unclaimedMissions.length) {
    return (
      <div className="bg-gray-100 dark:bg-[#1a1a1a] rounded-2xl p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">No unclaimed missions available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {unclaimedMissions.map(mission => (
        <div key={mission.id} className="bg-gray-100 dark:bg-[#1a1a1a] rounded-2xl p-4 space-y-1">
          <h3 className="text-base font-semibold text-black dark:text-white">{mission.mission.mission_name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{mission.mission.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex-1 pr-4">
              {/* Progress bar + step/completed indicator */}
              {(() => {
                const isCompleted =
                  mission.is_completed ||
                  (mission.number_of_steps_completed ?? 0) >= (mission.mission.number_of_steps ?? 0);
                return (
                  <div className="flex flex-col gap-2">
                    <div className="flex-1">
                      <div className="w-full bg-black/10 dark:bg-white/10 rounded-full" style={{ height: 4 }}>
                        <div
                          className={`rounded-full bg-white dark:bg-white`}
                          style={{
                            width: `${Math.min(Math.max(Number(mission.progress_percentage) || 0, 0), 100)}%`,
                            height: 4,
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center shrink-0 justify-end">
                      {isCompleted ? (
                        <div className="text-white dark:text-white text-md">Completed</div>
                      ) : (
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                          {mission.number_of_steps_completed} / {mission.mission.number_of_steps}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="flex gap-2">
              {mission.is_completed ? (
                <RoundedCornerButton
                  className="w-[120px] font-bold"
                  onClick={() => handleClaim(mission.id)}
                  fillColor="#FFFFFF"
                  strokeColor="#111111"
                >
                  Claim
                </RoundedCornerButton>
              ) : isSocialMission(mission.mission) ? (
                <RoundedCornerButton
                  className="w-[120px] font-bold"
                  onClick={() => handleSocialMission(mission.id, mission.mission.description)}
                  fillColor="#163fbf"
                  strokeColor="#FFFFFF"
                >
                  {getSocialActionLabel(mission.mission.description)}
                </RoundedCornerButton>
              ) : (
                <RoundedCornerButton
                  className="w-[120px] font-bold"
                  fillColor="#262626"
                  disabled={true}
                  strokeColor="#FFFFFF"
                >
                  {mission.mission.reward_points} XP
                </RoundedCornerButton>
                // <button
                //   disabled
                //   className="px-4 py-2 rounded-lg font-medium bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                // >
                //   Incomplete
                // </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
