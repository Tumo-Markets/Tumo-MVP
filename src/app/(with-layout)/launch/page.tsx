'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import PageTransition from 'src/components/PageTransition';
import { Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from 'src/components/ui/form';
import { useAddMarket } from 'src/states/markets';
import { toast } from 'react-toastify';

const formSchema = z.object({
  tokenName: z.string().min(1, 'Token name is required'),
  tokenSymbol: z.string().min(1, 'Token symbol is required'),
  tokenAddress: z.string().min(1, 'Token address is required'),
  eventDuration: z.string().min(1, 'Please select a duration'),
});

type FormValues = z.infer<typeof formSchema>;

export default function LaunchPage() {
  const [isCreating, setIsCreating] = useState(false);

  const router = useRouter();
  const addMarket = useAddMarket();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tokenName: '',
      tokenSymbol: '',
      tokenAddress: '',
      eventDuration: '',
    },
  });

  const onSubmit = useCallback(
    async (data: FormValues) => {
      // Create a market record with the form data
      const newMarket = {
        id: Date.now().toString(),
        tokenName: data.tokenName,
        tokenSymbol: data.tokenSymbol,
        tokenAddress: data.tokenAddress,
        eventDuration: data.eventDuration,
        volume: Math.floor(Math.random() * 100000), // Random demo volume
        trades: Math.floor(Math.random() * 1000), // Random demo trades
        createdAt: new Date().toLocaleDateString('en-US'),
      };

      // Add to Jotai store
      addMarket(newMarket);
      setIsCreating(true);
      await new Promise(resolve => setTimeout(resolve, 10000)); // Simulate async operation
      setIsCreating(false);
      toast.success('Market created successfully!');
      // Navigate to dashboard
      router.push(`/markets`);
    },
    [addMarket, router],
  );

  return (
    <PageTransition direction="forward">
      <div className="flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Launch Your Market</h1>
            <p className="text-muted-foreground">Create a customized futures trading market in one click</p>
          </div>

          <div className="rounded-lg border border-[#958794] bg-background p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="tokenName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-tertiary-foreground">Token Name</FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          disabled={isCreating}
                          placeholder="e.g., Dogecoin"
                          className="w-full px-4 py-3 rounded-lg bg-secondary/30 border border-[#958794]/30 text-foreground focus:outline-none focus:border-[#958794] transition-colors"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tokenSymbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-tertiary-foreground">Token Symbol</FormLabel>
                      <FormControl>
                        <input
                          disabled={isCreating}
                          {...field}
                          placeholder="e.g., DOGE"
                          className="w-full px-4 py-3 rounded-lg bg-secondary/30 border border-[#958794]/30 text-foreground focus:outline-none focus:border-[#958794] transition-colors"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tokenAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-tertiary-foreground">Token Address</FormLabel>
                      <FormControl>
                        <input
                          disabled={isCreating}
                          {...field}
                          placeholder="e.g., 0x1234...5678"
                          className="w-full px-4 py-3 rounded-lg bg-secondary/30 border border-[#958794]/30 text-foreground focus:outline-none focus:border-[#958794] transition-colors"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eventDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-tertiary-foreground">Event Duration</FormLabel>
                      <FormControl>
                        <select
                          disabled={isCreating}
                          {...field}
                          className="w-full px-4 py-3 rounded-lg bg-black border border-[#958794]/30 text-foreground focus:outline-none focus:border-[#958794] transition-colors"
                        >
                          <option value="">Select duration</option>
                          <option value="1h">1 Hour</option>
                          <option value="4h">4 Hours</option>
                          <option value="1d">1 Day</option>
                          <option value="7d">7 Days</option>
                          <option value="30d">30 Days</option>
                          <option value="perpetual">Perpetual</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-lg bg-linear-to-r from-[#1c54ff] to-[#001a61] hover:from-[#163fbf] hover:to-[#001244] text-white font-bold transition-all"
                >
                  {isCreating ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating Market
                    </span>
                  ) : (
                    'Create Market'
                  )}
                </button>
              </form>
            </Form>

            <div className="mt-6 p-6 rounded-lg bg-secondary/20 border border-[#958794]/30">
              <h3 className="text-blue-400 font-semibold mb-3">What happens next?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">✓</span>
                  Telegram Mini App link generated
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">✓</span>
                  Instant distribution to your community
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
