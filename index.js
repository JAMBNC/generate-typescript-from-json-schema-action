import core from "@actions/core";

try {
  const baseUrl = "https://api.fastly.com";
  const serviceId = core.getInput("fastly_service_id");
  const apiKey = core.getInput("fastly_api_key");
  const baseHeaders = {
    "Fastly-Key": apiKey,
  };

  const dictionaryName = core.getInput("dictionary_name");
  const dictionaryKey = core.getInput("dictionary_key");
  const dictionaryValue = core.getInput("dictionary_value");
  const surrogateKey = core.getInput("purge_surrogate_key");

  const getLatestVersion = async () => {
    const resp = await fetch(`${baseUrl}/service/${serviceId}/version`, {
      headers: baseHeaders,
    });
    const data = await resp.json();
    return data[data.length - 1].number;
  };

  const getDictionaryId = async (version, name) => {
    const resp = await fetch(
      `${baseUrl}/service/${serviceId}/version/${version}/dictionary`,
      {
        headers: baseHeaders,
      }
    );
    const data = await resp.json();
    const dict = data.find((d) => d.name === name);
    if (dict) return dict.id;
  };

  const updateDictionaryItem = async (name, key, value) => {
    const version = await getLatestVersion();
    const dictId = await getDictionaryId(version, name);
    const uri = `${baseUrl}/service/${serviceId}/dictionary/${dictId}/item/${key}`;
    const resp = await fetch(uri, {
      method: "PUT",
      headers: baseHeaders,
      body: new URLSearchParams({
        item_value: value,
      }),
    });
    const data = await resp.json();
    return data;
  };

  const purgeSurrogateKey = async (surrogateKey) => {
    const resp = await fetch(
      `${baseUrl}/service/${serviceId}/purge/${surrogateKey}`,
      {
        method: "POST",
        headers: baseHeaders,
      }
    );
    return await resp.json();
  };

  const update = await updateDictionaryItem(
    dictionaryName,
    dictionaryKey,
    dictionaryValue
  );
  console.log(update);

  if (surrogateKey.length) {
    const purge = await purgeSurrogateKey(surrogateKey);
    console.log(purge);
  }
} catch (error) {
  core.setFailed(error.message);
}
