'use client';

import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from 'src/components/ui/form';
import { Input } from 'src/components/ui/input';
import { toast } from 'react-toastify';

type FormValues = {
  tokenAddress: string;
};

export default function InformationForm() {
  const form = useForm<FormValues>({
    defaultValues: {
      tokenAddress: '',
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log('Token Address:', data.tokenAddress);
    toast.success(`Token address submitted: ${data.tokenAddress}`);
  };

  return (
    <div className="mx-auto mt-8 p-6 w-full max-w-sm rounded-lg" style={{ backgroundColor: 'var(--card)' }}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="tokenAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Token Address</FormLabel>
                <FormControl>
                  <Input placeholder="Address..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-linear-to-r from-[#1c54ff] to-[#001a61] dark:from-[#e4e9ff] dark:to-[#4c5061] hover:from-[#163fbf] hover:to-[#001244] text-white dark:text-black font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={form.formState.isSubmitting}
          >
            Submit
          </button>
        </form>
      </Form>
    </div>
  );
}
