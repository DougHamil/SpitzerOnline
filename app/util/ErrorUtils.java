package util;

import java.util.Map;

import org.codehaus.jackson.JsonNode;

import play.libs.Json;

import com.google.common.collect.Maps;

public class ErrorUtils {

	public static JsonNode error(Integer id, String message, Object... extraData)
	{
		Map<String, Object> data = Maps.newHashMap();
		
		data.put("error", message);
		data.put("errorCode", id);
		data.put("data", extraData);
		
		return Json.toJson(data);
	}
	
	public static JsonNode error(GameError error, Object... extraData)
	{
		return error(error.getId(), error.getMessage(), extraData);
	}
	
	public static JsonNode error(int id, Object... extraData)
	{
		return error(GameError.fromId(id), extraData);
	}
}
