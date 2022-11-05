electron -i <<< 'process.exit(parseInt(process.versions.node, 10))' &> /dev/null
NODE_VERSION=$?
export NODE_OPTIONS='--no-warnings --tls-cipher-list="DHE-RSA-AES128-GCM-SHA256 ECDHE-RSA-AES128-GCM-SHA256 DHE-RSA-AES256-GCM-SHA384 ECDHE-RSA-AES256-GCM-SHA384"'

if [[ $NODE_VERSION == 16 ]]; then
  export NODE_OPTIONS+=' --experimental-global-webcrypto --experimental-fetch'
elif [[ "$NODE_VERSION" == 18 ]]; then
  export NODE_OPTIONS+=' --experimental-global-webcrypto'
fi
