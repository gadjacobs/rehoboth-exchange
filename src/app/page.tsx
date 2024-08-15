'use client';
import { useEffect, useState } from 'react';
import client from '../lib/sanity';
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form';
import { FiInfo } from 'react-icons/fi';
import { Tooltip } from 'react-tooltip';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-tooltip/dist/react-tooltip.css';
import Select, { SingleValue } from 'react-select';

interface Coin {
  _id: string;
  name: string;
  symbol: string;
  price_usd: number;
}

interface CurrencyRate {
  [key: string]: number;
}

interface OptionType {
  value: string;
  label: string;
}

interface FormData {
  cryptoAmount: number;
  fiatAmount: number;
  cryptoCurrency: OptionType;
  fiatCurrency: OptionType;
  walletAddress: string;
}

export default function Home() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      cryptoCurrency: { value: 'BTC', label: 'Bitcoin (BTC)' },
      fiatCurrency: { value: 'NGN', label: 'NGN (Nigeria Naira)' },
    },
  });

  const [coins, setCoins] = useState<Coin[]>([]);
  const [currencyRate, setCurrencyRate] = useState<CurrencyRate | null>(null);
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const cryptoCurrency = watch('cryptoCurrency');
  const fiatCurrency = watch('fiatCurrency');
  const cryptoAmount = watch('cryptoAmount');
  const fiatAmount = watch('fiatAmount');

  useEffect(() => {
    client
      .fetch<Coin[]>('*[_type == "cryptocurrency"]')
      .then((data) => {
        setCoins(data);
        const initialCoin = data.find((c) => c.symbol === cryptoCurrency.value);
        setSelectedCoin(initialCoin || null);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching coins:', error);
        setLoading(false);
      });

    axios
      .get('https://openexchangerates.org/api/latest.json', {
        params: {
          app_id: process.env.NEXT_PUBLIC_OPENEXCHANGE_APP_ID,
        },
      })
      .then((response) => {
        setCurrencyRate(response.data.rates);
      })
      .catch((error) => {
        console.error('Error fetching currency rates:', error);
      });
  }, []);

  useEffect(() => {
    if (cryptoCurrency.value && coins.length > 0) {
      const coin = coins.find((c) => c.symbol === cryptoCurrency.value);
      setSelectedCoin(coin || null);
      if (coin) {
        const usdEquivalent = cryptoAmount * coin.price_usd;
        const fiatValue =
          usdEquivalent * (currencyRate?.[fiatCurrency.value] || 1);
        setValue('fiatAmount', parseFloat(fiatValue.toFixed(2)));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cryptoCurrency, cryptoAmount, fiatCurrency, coins, currencyRate]);

  const handleCryptoChange = (value: number) => {
    if (selectedCoin && currencyRate) {
      const usdEquivalent = value * selectedCoin.price_usd;
      const fiatValue = usdEquivalent * currencyRate[fiatCurrency.value];
      setValue('fiatAmount', parseFloat(fiatValue.toFixed(2)));
    }
  };

  const handleFiatChange = (value: number) => {
    if (selectedCoin && currencyRate) {
      const usdEquivalent = value / currencyRate[fiatCurrency.value];
      const cryptoValue = usdEquivalent / selectedCoin.price_usd;
      setValue('cryptoAmount', parseFloat(cryptoValue.toFixed(6)));
    }
  };

  const handlePayment = (data: FormData) => {
    if (!selectedCoin) {
      toast.error('Please select a cryptocurrency.');
      return;
    }

    toast.info(
      `Proceeding with payment of ${data.fiatAmount} ${data.fiatCurrency.value} for ${data.cryptoAmount} ${selectedCoin.symbol}`
    );
    // Implement Paystack payment integration here
  };

  if (loading) {
    return <p className="text-gray-700">Loading coins...</p>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 bg-white rounded shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Purchase Coins
        </h2>
        <form onSubmit={handleSubmit(handlePayment)} className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-1/2">
              <label
                htmlFor="cryptoCurrency"
                className="block text-sm font-medium text-gray-700"
              >
                Coin
              </label>
              <Controller
                name="cryptoCurrency"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={coins.map((coin) => ({
                      value: coin.symbol,
                      label: `${coin.name} (${coin.symbol})`,
                    }))}
                    value={field.value}
                    onChange={(selectedOption: SingleValue<OptionType>) => {
                      field.onChange(selectedOption);
                    }}
                  />
                )}
              />
            </div>
            <div className="w-1/2">
              <label
                htmlFor="cryptoAmount"
                className="block text-sm font-medium text-gray-700"
              >
                Amount
              </label>
              <input
                type="number"
                id="cryptoAmount"
                {...register('cryptoAmount', {
                  required: 'Please enter a crypto amount',
                })}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setValue('cryptoAmount', value);
                  handleCryptoChange(value);
                }}
                step="any"
                className={`mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary ${
                  errors.cryptoAmount ? 'border-red-500' : ''
                }`}
              />
              {errors.cryptoAmount && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.cryptoAmount.message}
                </p>
              )}
            </div>
          </div>

          {/* Fiat Section */}
          <div className="flex items-center space-x-4">
            <div className="w-1/2">
              <label
                htmlFor="fiatCurrency"
                className="block text-sm font-medium text-gray-700"
              >
                Fiat
              </label>
              <Controller
                name="fiatCurrency"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={[
                      { value: 'NGN', label: 'NGN (Nigeria Naira)' },
                      { value: 'USD', label: 'USD (US Dollar)' },
                      { value: 'EUR', label: 'EUR (Euro)' },
                      { value: 'GBP', label: 'GBP (British Pound)' },
                      { value: 'KES', label: 'KES (Kenya Shilling)' },
                      { value: 'ZAR', label: 'ZAR (South African Rand)' },
                    ]}
                    value={field.value}
                    onChange={(selectedOption: SingleValue<OptionType>) => {
                      field.onChange(selectedOption);
                    }}
                  />
                )}
              />
            </div>
            <div className="w-1/2">
              <label
                htmlFor="fiatAmount"
                className="block text-sm font-medium text-gray-700"
              >
                Amount
              </label>
              <input
                type="number"
                id="fiatAmount"
                {...register('fiatAmount', {
                  required: 'Please enter a fiat amount',
                })}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setValue('fiatAmount', value);
                  handleFiatChange(value);
                }}
                step="any"
                className={`mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary ${
                  errors.fiatAmount ? 'border-red-500' : ''
                }`}
              />
              {errors.fiatAmount && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.fiatAmount.message}
                </p>
              )}
            </div>
          </div>

          {/* Wallet Address */}
          <div className="relative">
            <label
              htmlFor="walletAddress"
              className="block text-sm font-medium text-gray-700"
            >
              Wallet Address
              <span
                data-tooltip-id="wallet-tooltip"
                data-tooltip-content="Enter the address where you want to receive the cryptocurrency"
                className="ml-1"
              >
                <FiInfo className="inline text-gray-400 cursor-pointer" />
              </span>
            </label>
            <Tooltip id="wallet-tooltip" />
            <input
              type="text"
              id="walletAddress"
              {...register('walletAddress', {
                required: 'Please enter your wallet address',
              })}
              className={`mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary ${
                errors.walletAddress ? 'border-red-500' : ''
              }`}
            />
            {errors.walletAddress && (
              <p className="text-red-500 text-sm mt-1">
                {errors.walletAddress.message}
              </p>
            )}
          </div>

          {/* Display Conversion */}
          <div className="text-center">
            <p className="text-lg font-semibold">
              You will receive: {cryptoAmount} {cryptoCurrency.value}
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Proceed to Payment
          </button>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
}
