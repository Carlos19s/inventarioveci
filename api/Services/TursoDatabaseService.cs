using System.Globalization;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace VeciBar.Api.Services;

public class TursoDatabaseService
{
    private readonly HttpClient _httpClient;
    private readonly string _pipelineUrl;
    private readonly string _authToken;
    private readonly ILogger<TursoDatabaseService> _logger;

    public TursoDatabaseService(IConfiguration config, ILogger<TursoDatabaseService> logger)
    {
        _logger = logger;
        var baseUrl = config["Turso:Url"]?.TrimEnd('/') ?? "https://inventariobar-carlos19s.aws-us-east-1.turso.io";
        _pipelineUrl = $"{baseUrl}/v2/pipeline";
        _authToken = config["Turso:AuthToken"] ?? string.Empty;

        _httpClient = new HttpClient();
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _authToken);
    }

    private JsonArray BuildArgsArray((string type, object value)[] args)
    {
        var argsArray = new JsonArray();
        foreach (var (t, val) in args)
        {
            var argNode = new JsonObject();
            if (t == "float")
            {
                argNode["type"] = "float";
                if (double.TryParse(val?.ToString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var d))
                {
                    argNode["value"] = d;
                }
                else
                {
                    argNode["value"] = 0.0;
                }
            }
            else if (t == "integer")
            {
                argNode["type"] = "integer";
                argNode["value"] = val?.ToString() ?? "0";
            }
            else
            {
                argNode["type"] = "text";
                argNode["value"] = val?.ToString() ?? "";
            }
            argsArray.Add(argNode);
        }
        return argsArray;
    }

    public async Task<List<Dictionary<string, object?>>> QueryAsync(string sql, params (string type, object value)[] args)
    {
        var stmtObj = new JsonObject { ["sql"] = sql };
        if (args.Length > 0)
        {
            stmtObj["args"] = BuildArgsArray(args);
        }

        var payload = new JsonObject
        {
            ["requests"] = new JsonArray
            {
                new JsonObject
                {
                    ["type"] = "execute",
                    ["stmt"] = stmtObj
                },
                new JsonObject { ["type"] = "close" }
            }
        };

        var response = await _httpClient.PostAsJsonAsync(_pipelineUrl, payload);
        response.EnsureSuccessStatusCode();

        var jsonStr = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(jsonStr);

        var results = doc.RootElement.GetProperty("results");
        if (results.GetArrayLength() == 0) return new List<Dictionary<string, object?>>();

        var first = results[0];
        if (first.GetProperty("type").GetString() != "ok")
        {
            var error = first.TryGetProperty("error", out var err) ? err.ToString() : "Turso query error";
            throw new InvalidOperationException($"Turso execution failed: {error}");
        }

        var resObj = first.GetProperty("response").GetProperty("result");
        var cols = resObj.GetProperty("cols");
        var rows = resObj.GetProperty("rows");

        var colNames = new List<string>();
        foreach (var c in cols.EnumerateArray())
        {
            colNames.Add(c.GetProperty("name").GetString() ?? "");
        }

        var list = new List<Dictionary<string, object?>>();
        foreach (var r in rows.EnumerateArray())
        {
            var dict = new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase);
            int idx = 0;
            foreach (var cell in r.EnumerateArray())
            {
                var col = colNames[idx];
                var type = cell.GetProperty("type").GetString();
                object? val = null;
                if (type != "null" && cell.TryGetProperty("value", out var v))
                {
                    val = v.ToString();
                }
                dict[col] = val;
                idx++;
            }
            list.Add(dict);
        }

        return list;
    }

    public async Task<int> ExecuteAsync(string sql, params (string type, object value)[] args)
    {
        var stmtObj = new JsonObject { ["sql"] = sql };
        if (args.Length > 0)
        {
            stmtObj["args"] = BuildArgsArray(args);
        }

        var payload = new JsonObject
        {
            ["requests"] = new JsonArray
            {
                new JsonObject
                {
                    ["type"] = "execute",
                    ["stmt"] = stmtObj
                },
                new JsonObject { ["type"] = "close" }
            }
        };

        var response = await _httpClient.PostAsJsonAsync(_pipelineUrl, payload);
        response.EnsureSuccessStatusCode();

        var jsonStr = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(jsonStr);

        var first = doc.RootElement.GetProperty("results")[0];
        if (first.GetProperty("type").GetString() != "ok")
        {
            var error = first.TryGetProperty("error", out var err) ? err.ToString() : "Turso execution error";
            throw new InvalidOperationException($"Turso execution failed: {error}");
        }

        var resObj = first.GetProperty("response").GetProperty("result");
        if (resObj.TryGetProperty("affected_row_count", out var aff))
        {
            return aff.GetInt32();
        }
        return 0;
    }

    public async Task<long?> ExecuteAndGetLastInsertIdAsync(string sql, params (string type, object value)[] args)
    {
        var stmtObj = new JsonObject { ["sql"] = sql };
        if (args.Length > 0)
        {
            stmtObj["args"] = BuildArgsArray(args);
        }

        var payload = new JsonObject
        {
            ["requests"] = new JsonArray
            {
                new JsonObject
                {
                    ["type"] = "execute",
                    ["stmt"] = stmtObj
                },
                new JsonObject { ["type"] = "close" }
            }
        };

        var response = await _httpClient.PostAsJsonAsync(_pipelineUrl, payload);
        response.EnsureSuccessStatusCode();

        var jsonStr = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(jsonStr);

        var first = doc.RootElement.GetProperty("results")[0];
        if (first.GetProperty("type").GetString() != "ok")
        {
            var error = first.TryGetProperty("error", out var err) ? err.ToString() : "Turso execution error";
            throw new InvalidOperationException($"Turso execution failed: {error}");
        }

        var resObj = first.GetProperty("response").GetProperty("result");
        if (resObj.TryGetProperty("last_insert_rowid", out var rowIdProp))
        {
            var valStr = rowIdProp.GetString();
            if (long.TryParse(valStr, out var id)) return id;
        }

        return null;
    }
}
