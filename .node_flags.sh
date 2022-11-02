NODE_VERSION=$(node -v)
export NODE_OPTIONS='--experimental-loader=@esbuild-kit/esm-loader --no-warnings --tls-cipher-list="DHE-RSA-AES128-GCM-SHA256 ECDHE-RSA-AES128-GCM-SHA256 DHE-RSA-AES256-GCM-SHA384 ECDHE-RSA-AES256-GCM-SHA384"'

if [[ $NODE_VERSION == "v16."* ]]; then
  export NODE_OPTIONS+=' --experimental-global-webcrypto --experimental-fetch'
elif [[ "$NODE_VERSION" == "v18."* ]]; then
  export NODE_OPTIONS+=' --experimental-global-webcrypto'
fi
